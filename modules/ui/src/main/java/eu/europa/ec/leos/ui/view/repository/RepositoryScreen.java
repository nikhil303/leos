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
package eu.europa.ec.leos.ui.view.repository;

import eu.europa.ec.leos.domain.vo.ValidationVO;
import eu.europa.ec.leos.ui.model.RepositoryType;
import eu.europa.ec.leos.vo.catalog.CatalogItem;
import eu.europa.ec.leos.domain.common.Result;
import eu.europa.ec.leos.domain.vo.DocumentVO;

import java.util.List;

interface RepositoryScreen {

    void populateData(final List<DocumentVO> documentVOs);

    void showCreateDocumentWizard(List<CatalogItem> catalogItems);

    void showCreateMandateWizard();

    void showUploadDocumentWizard();

    void setRepositoryType(RepositoryType repositoryType);

    void showValidationResult(ValidationVO result);

    void showPostProcessingResult(Result result);
}
