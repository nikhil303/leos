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
package eu.europa.ec.leos.annotate.services;

import eu.europa.ec.leos.annotate.model.UserDetails;
import org.springframework.web.client.RestTemplate;

/**
 * interface extending standard UserService interface; contains additional functions that should be used for testing purposes only
 */
public interface UserServiceWithTestFunctions extends UserService {

    void cacheUserDetails(String key, UserDetails details);
    void setRestTemplate(RestTemplate restOps);
    void setGroupService(GroupService grpServ);
}
