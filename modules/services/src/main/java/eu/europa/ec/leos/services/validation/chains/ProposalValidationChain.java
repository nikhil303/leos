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
package eu.europa.ec.leos.services.validation.chains;


import eu.europa.ec.leos.domain.cmis.LeosCategory;
import eu.europa.ec.leos.domain.vo.DocumentVO;
import eu.europa.ec.leos.services.validation.handlers.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProposalValidationChain extends ValidationChain{

    @Autowired
    ProposalValidationChain(ProposalStructureValidator proposalStructureValidator,
                            MetadataValidator metadataValidator,
                            GeneralDocumentValidator generalDocumentValidator,
                            AkomantosoXsdValidator akomantosoXsdValidator,
                            ChildrenValidator childrenValidator){
        chain.clear();
        chain.add(proposalStructureValidator);
        chain.add(metadataValidator);
        chain.add(generalDocumentValidator);
        chain.add(akomantosoXsdValidator);
        chain.add(childrenValidator);
    }
    
    public boolean supports(DocumentVO documentVO){
        return LeosCategory.PROPOSAL.equals(documentVO.getDocumentType());
    }
}
