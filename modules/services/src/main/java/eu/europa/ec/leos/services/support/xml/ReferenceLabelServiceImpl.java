/*
 * Copyright 2019 European Commission
 *
 * Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 *     https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and limitations under the Licence.
 */
package eu.europa.ec.leos.services.support.xml;

import com.google.common.base.Stopwatch;
import com.ximpleware.VTDNav;
import eu.europa.ec.leos.domain.common.ErrorCode;
import eu.europa.ec.leos.domain.common.Result;
import eu.europa.ec.leos.i18n.LanguageHelper;
import eu.europa.ec.leos.services.content.ReferenceLabelService;
import eu.europa.ec.leos.services.support.xml.ref.LabelHandler;
import eu.europa.ec.leos.services.support.xml.ref.Ref;
import eu.europa.ec.leos.services.support.xml.ref.TreeHelper;
import eu.europa.ec.leos.services.support.xml.ref.TreeNode;
import eu.europa.ec.leos.i18n.MessageHelper;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

import static eu.europa.ec.leos.services.support.xml.ref.TreeHelper.*;

abstract class ReferenceLabelServiceImpl implements ReferenceLabelProcessor, ReferenceLabelService {
    private static final Logger LOG = LoggerFactory.getLogger(ReferenceLabelServiceImpl.class);
    
    @Autowired
    private LanguageHelper languageHelper;
    
    @Autowired
    protected MessageHelper messageHelper;
    
    @Autowired
    private List<LabelHandler> labelHandlers;

    private static final String ARTICLE_NODE = "article";

    @Override
    public Result<String> generateLabel(List<String> references, String referenceLocation, byte[] xmlBytes) throws Exception {
        Stopwatch watch = Stopwatch.createStarted();
        try {
            VTDNav vtdNav = VTDUtils.setupVTDNav(xmlBytes, true);

            List<Ref> refs = references
                    .stream()
                    .map(ref -> {
                        String[] strs = ref.split(",");
                        return new Ref(strs[0], strs[1]);
                    })
                    .filter(ref -> !StringUtils.isEmpty(ref.getHref()))
                    .collect(Collectors.toList());
            return generateLabel(refs, referenceLocation, vtdNav);
        } finally {
            LOG.trace("Label generation finished in {} ms", watch.elapsed(TimeUnit.MILLISECONDS));
        }
    }

    @Override
    public Result<String> generateLabel(List<Ref> references, String referenceLocation, VTDNav xmlNav) throws Exception {
        TreeNode tree;
        tree = createTree(xmlNav, null, references);
        List<TreeNode> leaves = getLeaves(tree);//in xml order

        //Validate
        boolean valid = RefValidator.validate(leaves, references);

        //If invalid references, mark mref as broken and return
        if (!valid) {
            return new Result<String>(null, ErrorCode.DOCUMENT_REFERENCE_NOT_VALID);
        }

        TreeNode fullTree = createTree(xmlNav, null, Arrays.asList(new Ref("", referenceLocation)));
        TreeNode sourceNode = TreeHelper.find(fullTree, TreeNode::getIdentifier, referenceLocation);

        List<TreeNode> mrefCommonNodes = findCommonAncestor(xmlNav, referenceLocation, tree);
        //If Valid, generate, Tree is already sorted
        return new Result<String>(createLabel(leaves, mrefCommonNodes, sourceNode), null);
    }

    private String createLabel(List<TreeNode> refs, List<TreeNode> mrefCommonNodes, TreeNode sourceNode) {
        labelHandlers.sort(Comparator.comparingInt(LabelHandler::getOrder));
        StringBuffer accumulator = new StringBuffer();
        for (LabelHandler rule : labelHandlers) {
            boolean finish = rule.process(refs, mrefCommonNodes, sourceNode, accumulator, languageHelper.getCurrentLocale());
            if (finish) {
                break;
            }
        }
        return accumulator.toString();
    }

    static class RefValidator {
        private static final List<BiFunction<List<TreeNode>, List<Ref>, Boolean>> validationRules = new ArrayList<>();

        static {
            validationRules.add(RefValidator::checkEmpty);
            validationRules.add(RefValidator::checkSameParentAndSameType);
            validationRules.add(RefValidator::checkBrokenRefs);
        }

        static boolean validate(List<TreeNode> refs, List<Ref> oldRefs) {
            for (BiFunction<List<TreeNode>, List<Ref>, Boolean> rule : validationRules) {
                if (!rule.apply(refs, oldRefs)) {
                    return false;
                }
            }
            return true;
        }

        private static boolean checkBrokenRefs(List<TreeNode> refs, List<Ref> oldRefs) {
            return (refs.size() == oldRefs.size());
        }

        private static boolean checkEmpty(List<TreeNode> refs, List<Ref> oldRefs) {
            if (refs.isEmpty()) {
                return false;
            }
            return true;
        }

        private static boolean checkSameParentAndSameType(List<TreeNode> refs, List<Ref> oldRefs) {
            TreeNode parent = refs.get(0).getParent();
            String type = refs.get(0).getType();
            int depth = refs.get(0).getDepth();

            for (int i = 1; i < refs.size(); i++) {
                TreeNode ref= refs.get(i);
                if (!ref.getParent().equals(parent)
                        && !(ref.getType().equals(type) && (ref.getDepth() == depth || type.equalsIgnoreCase(ARTICLE_NODE)))) {
                    return false;
                }
            }
            return true;
        }
    }

}
