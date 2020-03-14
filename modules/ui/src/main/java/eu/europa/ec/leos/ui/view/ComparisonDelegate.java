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
package eu.europa.ec.leos.ui.view;

import com.vaadin.server.VaadinServletService;
import eu.europa.ec.leos.domain.cmis.document.XmlDocument;
import eu.europa.ec.leos.security.SecurityContext;
import eu.europa.ec.leos.services.compare.ContentComparatorContext;
import eu.europa.ec.leos.services.compare.ContentComparatorService;
import eu.europa.ec.leos.services.content.processor.TransformationService;
import eu.europa.ec.leos.web.support.UrlBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.HashMap;

import static eu.europa.ec.leos.services.compare.ContentComparatorService.*;

@Component
@Scope("prototype")
public class ComparisonDelegate<T extends XmlDocument> {

    private static final Logger LOG = LoggerFactory.getLogger(ComparisonDelegate.class);

    private final TransformationService transformerService;
    private final ContentComparatorService compareService;
    private final UrlBuilder urlBuilder;
    private final SecurityContext securityContext;

    @Autowired
    public ComparisonDelegate(TransformationService transformerService, ContentComparatorService compareService, UrlBuilder urlBuilder, SecurityContext securityContext) {
        this.transformerService = transformerService;
        this.compareService = compareService;
        this.urlBuilder = urlBuilder;
        this.securityContext = securityContext;
    }

    public String getMarkedContent(T oldVersion, T newVersion) {
        //FIXME collect list of processing to be done on comparison output and do it at single place.
        String cxtPath = urlBuilder.getWebAppPath(VaadinServletService.getCurrentServletRequest());
        String firstItemHtml = transformerService.formatToHtml(oldVersion, cxtPath, securityContext.getPermissions(oldVersion))
                .replaceAll("(?i)(href|onClick)=\".*?\"", "");// removing the links
        String secondItemHtml = transformerService.formatToHtml(newVersion, cxtPath, securityContext.getPermissions(newVersion))
                .replaceAll("(?i)(href|onClick)=\".*?\"", "");

        //FIXME Shortcut to replace all the original Ids in document. Need a discussion.
        return compareService.compareContents(new ContentComparatorContext.Builder(firstItemHtml, secondItemHtml)
                .withAttrName(ATTR_NAME)
                .withRemovedValue(CONTENT_REMOVED_CLASS)
                .withAddedValue(CONTENT_ADDED_CLASS)
                .build())
                .replaceAll("(?i) id=\"", " id=\"marked-");
    }

    public HashMap<Integer, Object> versionCompare(T oldVersion, T newVersion, int displayMode) {
        final int SINGLE_COLUMN_MODE = 1;
        final int TWO_COLUMN_MODE = 2;

        long startTime = System.currentTimeMillis();
        HashMap<Integer, Object> htmlCompareResult = new HashMap<>();

        String cxtPath = urlBuilder.getWebAppPath(VaadinServletService.getCurrentServletRequest());
        String firstItemHtml = transformerService.formatToHtml(oldVersion, cxtPath, securityContext.getPermissions(oldVersion))
                .replaceAll("(?i)(href|onClick)=\".*?\"", "");//removing the links
        String secondItemHtml = transformerService.formatToHtml(newVersion, cxtPath, securityContext.getPermissions(newVersion))
                .replaceAll("(?i)(href|onClick)=\".*?\"", "");

        if(displayMode==SINGLE_COLUMN_MODE){
            htmlCompareResult.put(SINGLE_COLUMN_MODE, compareService.compareContents(new ContentComparatorContext.Builder(firstItemHtml, secondItemHtml)
                    .withAttrName(ATTR_NAME)
                    .withRemovedValue(CONTENT_REMOVED_CLASS)
                    .withAddedValue(CONTENT_ADDED_CLASS)
                    .build()));
        }
        else if(displayMode==TWO_COLUMN_MODE){
            htmlCompareResult.put(TWO_COLUMN_MODE, compareService.twoColumnsCompareContents(new ContentComparatorContext.Builder(firstItemHtml, secondItemHtml).build()));
        }

        LOG.debug("Diff exec time: {} ms", (System.currentTimeMillis() - startTime));
        return htmlCompareResult;
    }
    
    public String doubleCompareHtmlContents(T originalProposal, T intermediateMajor, T current, boolean threeWayEnabled) {
        //FIXME collect list of processing to be done on comparison output and do it at single place.
        String ctxPath = urlBuilder.getWebAppPath(VaadinServletService.getCurrentServletRequest());
        
        String currentHtml = transformerService.formatToHtml(current, ctxPath, securityContext.getPermissions(current))
                .replaceAll("(?i)(href|onClick)=\".*?\"", "");
        
        if(threeWayEnabled) {
            String proposalHtml = transformerService.formatToHtml(originalProposal, ctxPath, securityContext.getPermissions(originalProposal))
                    .replaceAll("(?i)(href|onClick)=\".*?\"", "");// removing the links
            
            String intermediateMajorHtml = transformerService.formatToHtml(intermediateMajor, ctxPath, securityContext.getPermissions(intermediateMajor))
                    .replaceAll("(?i)(href|onClick)=\".*?\"", "");// removing the links
            
            return compareService.compareContents(new ContentComparatorContext.Builder(proposalHtml, currentHtml, intermediateMajorHtml)
                    .withAttrName(ATTR_NAME)
                    .withRemovedValue(DOUBLE_COMPARE_REMOVED_CLASS)
                    .withAddedValue(DOUBLE_COMPARE_ADDED_CLASS)
                    .withDisplayRemovedContentAsReadOnly(Boolean.TRUE)
                    .withThreeWayDiff(threeWayEnabled)
                    .build())
                    .replaceAll("(?i) id=\"", " id=\"doubleCompare-")
                    .replaceAll("(?i) leos:softmove_from=\"", " leos:softmove_from=\"doubleCompare-")
                    .replaceAll("(?i) leos:softmove_to=\"", " leos:softmove_to=\"doubleCompare-");
        }

        return currentHtml;
    }

    public String doubleCompareXmlContents(T originalProposal, T intermediateMajor, T current, boolean threeWayEnabled) {
        
        String currentXml = current.getContent().getOrError(() -> "Current document content is required!")
                .getSource().toString();
        
        if(threeWayEnabled) {
            String proposalXml = originalProposal.getContent().getOrError(() -> "Proposal document content is required!")
                    .getSource().toString();
            
            String intermediateMajorXml = intermediateMajor.getContent().getOrError(() -> "Intermadiate Major Version document content is required!")
                    .getSource().toString();
            
            return compareService.compareContents(new ContentComparatorContext.Builder(proposalXml, currentXml, intermediateMajorXml)
                    .withAttrName(ATTR_NAME)
                    .withRemovedValue(DOUBLE_COMPARE_REMOVED_CLASS)
                    .withAddedValue(DOUBLE_COMPARE_ADDED_CLASS)
                    .withDisplayRemovedContentAsReadOnly(Boolean.TRUE)
                    .withThreeWayDiff(threeWayEnabled)
                    .build());
        }

        return currentXml;
    }
}
