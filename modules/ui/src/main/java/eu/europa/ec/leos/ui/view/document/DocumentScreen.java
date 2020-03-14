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
package eu.europa.ec.leos.ui.view.document;

import com.vaadin.server.Resource;
import eu.europa.ec.leos.domain.vo.DocumentVO;
import eu.europa.ec.leos.model.user.User;
import eu.europa.ec.leos.security.LeosPermission;
import eu.europa.ec.leos.vo.coedition.CoEditionVO;
import eu.europa.ec.leos.vo.toc.TableOfContentItemVO;
import eu.europa.ec.leos.vo.toctype.TocItemType;
import eu.europa.ec.leos.web.event.view.document.CheckElementCoEditionEvent.Action;
import eu.europa.ec.leos.web.model.VersionInfoVO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

interface DocumentScreen {

    void setDocumentTitle(final String documentTitle);

    void setDocumentVersionInfo(VersionInfoVO versionInfoVO);

    void refreshContent(final String documentContent);

    void populateMarkedContent(final String diffContent);

    void populateDoubleComparisonContent(final String doubleComparisonContent);

    void setToc(List<TableOfContentItemVO> tableOfContentItemVoList);

    void setTocEditWindow(List<TableOfContentItemVO> tableOfContentItemVoList);

    void showElementEditor(String elementId, String elementTagName, String elementContent, String alternatives);

    void refreshElementEditor(String elementId, String elementTagName, String elementContent);

    void showTocEditWindow(List<TableOfContentItemVO> tableOfContentItemVoList,
            Map<TocItemType, List<TocItemType>> tableOfContentRules);

    void showTimeLineWindow(List documentVersions);

    void updateTimeLineWindow(List documentVersions);

    void showMajorVersionWindow();

    void showImportWindow();

    void displayComparison(HashMap<Integer, Object> htmlCompareResult);

    void setTocAndAncestors(List<TableOfContentItemVO> tocItemList, List<String> elementAncestorsIds);

    void setElement(String elementId, String elementTagName, String elementContent);

    void setUserGuidance(String jsonGuidance);

    void sendUserPermissions(List<LeosPermission> userPermissions);

    void displaySearchedContent(String content);

    void closeImportWindow();

    void setPermissions(DocumentVO bill);

    void scrollToMarkedChange(final String elementId);

    void scrollTo(final String elementId);

    void setReferenceLabel(String referenceLabels);

    void updateUserCoEditionInfo(List<CoEditionVO> coEditionVos, String presenterId);

    void displayDocumentUpdatedByCoEditorWarning();

    void checkElementCoEdition(List<CoEditionVO> coEditionVos, User user, final String elementId, final String elementTagName, final Action action, final Object actionEvent);

    void showAlertDialog(String messageKey);
    
    void setDownloadStreamResource(Resource downloadstreamResource);
}
