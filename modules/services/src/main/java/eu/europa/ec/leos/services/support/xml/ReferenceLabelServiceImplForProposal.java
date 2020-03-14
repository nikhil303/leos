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

import com.ximpleware.VTDNav;
import eu.europa.ec.leos.domain.common.InstanceType;
import eu.europa.ec.leos.domain.common.Result;
import eu.europa.ec.leos.instance.Instance;
import eu.europa.ec.leos.services.support.xml.ref.Ref;
import org.springframework.stereotype.Service;

@Service
@Instance(instances = {InstanceType.OS, InstanceType.COMMISSION})
public class ReferenceLabelServiceImplForProposal extends ReferenceLabelServiceImpl {

    @Override
    public Result<String> generateSoftmoveLabel(Ref ref, String referenceLocation, VTDNav vtdNav, String direction) throws Exception {
        return new Result<String>("", null);
    }
}
