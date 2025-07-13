package in.edu.ssn.hostel.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private static final String ADMIN_EMAIL = "mohit2310893@ssn.edu.in";
    private static final String ALLOWED_DOMAIN = "@ssn.edu.in";

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User user = delegate.loadUser(request);

        String email = user.getAttribute("email");

        if (email == null || !email.endsWith(ALLOWED_DOMAIN)) {
            throw new OAuth2AuthenticationException(new OAuth2Error("domain"), "Access denied: Only SSN email accounts are allowed.");
        }

        String role = email.equalsIgnoreCase(ADMIN_EMAIL) ? "ADMIN" : "STUDENT";

        Map<String, Object> attributes = new HashMap<>(user.getAttributes());
        attributes.put("role", role);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
    }
}
