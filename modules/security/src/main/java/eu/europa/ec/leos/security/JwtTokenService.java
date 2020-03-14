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
package eu.europa.ec.leos.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.SignatureVerificationException;
import org.apache.commons.lang3.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

/**
 * Default class to generate and validate tokens.
 */
@Component
class JwtTokenService implements TokenService {
    private static final Logger LOG = LoggerFactory.getLogger(JwtTokenService.class);

    // Authority should be made parameter if we need tokens for more than one systems
    @Value("${annotate.authority}")
    private String annotateAuthority;
    @Value("${annotate.jwt.issuer.client.id}")
    private String annotateClientId;
    @Value("${annotate.jwt.issuer.client.secret}")
    private String annotateSecret;
    private static final int ANNOT_TOKEN_EXPIRE_IN_MIN = 9;
    
    @Value("${leos.api.jwt.auth.access.token.id}")
    private String leosApiId;
    @Value("${leos.api.jwt.auth.access.token.secret}")
    private String leosApiSecret;
    @Value("${leos.api.jwt.auth.access.token.expire.min}")
    private int accessTokenExpirationInMin;
    @Value("${leos.api.jwt.auth.clients}")
    private String authClients;
    private List<AuthClient> registeredClients = new ArrayList<>();
    
    @Autowired
    @Qualifier("applicationProperties")
    private Properties applicationProperties;
    
    @Autowired
    JwtTokenService() {
        LOG.debug("Using jwt security tokens");
    }
    
    @PostConstruct
    public void init() {
        String[] clientsNames = authClients.split(",");
        String keyPrefix = "leos.api.jwt.auth.client.";
        for (String clientName : clientsNames) {
            String clientId = applicationProperties.getProperty(keyPrefix + clientName + ".id");
            String clientSecret = applicationProperties.getProperty(keyPrefix + clientName + ".secret");
            if(clientId == null || clientSecret == null){
                LOG.error("the key 'leos.api.jwt.auth.clients' and its corresponding clientId/secret is not configured correctly for each single client");
                // for now we do not block the deployment of the application throwing an Exception
            } else {
                // if not configured correctly we do not add to the list of the known clients
                registeredClients.add(new AuthClient(clientName, clientId, clientSecret));
            }
        }
    }
    
    /**
     * Generate jwtToken(jwt-bearer) in order to communicate with Annotate server.
     * In this case LEOS is the client and Annotate is the server.
     * AccessTokens are generated by the server, and jwtToken(jwt-bearer) by the client.
     */
    @Override
    public String getAnnotateToken(String userLogin, String url) {
        Validate.notNull(userLogin, "User login is required for security token!!");
        Validate.notNull(url, "URL is required for security token!!");
    
        final String subject = String.format("acct:%s@%s", userLogin, annotateAuthority);
        final String audience = getDomainName(url);
        final Date now = Calendar.getInstance().getTime();
        return generateToken(annotateClientId, subject, audience, now, now, ANNOT_TOKEN_EXPIRE_IN_MIN, annotateSecret);
    }
    
    /**
     * Generate Access Token using server Id and server Secret (LEOS). The token should be verified with the same issuer/secret
     * AccessTokens are generated by the server, and jwtToken(jwt-bearer) by the client.
     */
    @Override
    public String getAccessToken() {
        final Date now = Calendar.getInstance().getTime();
        return generateToken(leosApiId, null, null, now, now, accessTokenExpirationInMin, leosApiSecret);
    }
    
    private String generateToken(String clientId, String subject, String audience, Date issuedAt, Date notBefore, int expireInMin, String secret) {
        String token = null;
        try {
            Calendar expires = Calendar.getInstance();
            expires.add(Calendar.MINUTE, expireInMin);
            Date expiresAt = expires.getTime();

            Algorithm algorithm = Algorithm.HMAC256(secret);
            token = JWT.create()
                    .withIssuer(clientId)
                    .withSubject(subject)
                    .withAudience(audience)
                    .withIssuedAt(issuedAt)
                    .withNotBefore(notBefore)
                    .withExpiresAt(expiresAt)
                    .sign(algorithm);
        } catch (UnsupportedEncodingException e) {
            //UTF-8 encoding not supported
            LOG.error("Error occurred while token validation. Error: {}", e.getMessage());
        } catch (JWTCreationException e) {
            //Invalid Signing configuration / Couldn't convert Claims.
            LOG.error("Error occurred while token validation. Error: {}", e.getMessage());
        }
        return token;
    }
    
    /**
     * Check in the list of the saved clients if any of them can verify the token. If yes, set that client as verified which means
     * he was the one who sent the token to LEOS.
     * This operation is needed when a client asks for an accessToken, only after verifying the client we generate and send the accessToken.
     * AccessTokens are generated by the server, and jwtToken(jwt-bearer) by the client.
     * @return The client who verified the token, or empty client if the token cannot be verified.
     */
    public AuthClient validateClientByJwtToken(String token) {
        for (AuthClient authClient : registeredClients) {
            boolean isValid = isTokenValid(authClient.getClientId(), authClient.getSecret(), token);
            if(isValid){
                LOG.debug("AccessToken correctly validated for client {} ", authClient.getName());
                authClient.setVerified(true);
                return authClient;
            }
        }
        return new AuthClient();//no client found
    }
    
    /**
     * Validate if the token has been previously generated by the server (leos).
     * AccessTokens are generated by the server, and jwtToken(jwt-bearer) by the client.
     * @return true, if the token can be verified by the server.
     */
    public boolean validateAccessToken(String token) {
        return isTokenValid(leosApiId, leosApiSecret, token);
    }
    
    private boolean isTokenValid(String clientId, String secret, String token) {
        try {
            JWT.require(Algorithm.HMAC256(secret))
                    .withIssuer(clientId)
                    .acceptExpiresAt(accessTokenExpirationInMin)
                    .build()
                    .verify(token);
            return true;
        } catch (SignatureVerificationException e) {
            return false; //wrong token
        } catch (Exception e) {
            LOG.error("Error occurred while token validation. Error: {}", e.getMessage());
            return false;
        }
    }

    private String getDomainName(String url) {
        try {
            URI uri = new URI(url);
            String domain = uri.getHost();
            return domain.startsWith("www.") ? domain.substring(4) : domain;
        } catch (URISyntaxException ue) {
            return url;
        }
    }
}
