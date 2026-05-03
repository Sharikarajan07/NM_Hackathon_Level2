package com.ticketing.auth.oauth;

import com.ticketing.auth.entity.User;
import com.ticketing.auth.service.OAuthUserService;
import com.ticketing.auth.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuthUserService oauthUserService;
    private final JwtUtil jwtUtil;

    @Value("${auth.oauth.frontend-redirect-url:http://localhost:3000/oauth-success}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        String provider = authToken.getAuthorizedClientRegistrationId();
        OAuth2User oauthUser = (OAuth2User) authToken.getPrincipal();
        Map<String, Object> attributes = oauthUser.getAttributes();

        OAuthProfile profile = mapProfile(provider, attributes);
        if (profile.email == null || profile.email.isBlank()) {
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("error", "oauth_unregistered")
                .queryParam("provider", provider)
                .build()
                .toUriString();
            response.sendRedirect(redirectUrl);
            return;
        }

        User existingUser = oauthUserService.findByEmail(profile.email).orElse(null);
        if (existingUser == null) {
            String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("error", "oauth_unregistered")
                .queryParam("email", profile.email)
                .queryParam("provider", provider)
                .build()
                .toUriString();
            response.sendRedirect(redirectUrl);
            return;
        }

        User user = oauthUserService.updateOAuthUser(
            existingUser,
            provider,
            profile.providerId,
            profile.firstName,
            profile.lastName
        );

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("token", token)
                .queryParam("userId", user.getId())
                .queryParam("email", user.getEmail())
                .queryParam("firstName", user.getFirstName())
                .queryParam("lastName", user.getLastName())
                .queryParam("role", user.getRole())
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private OAuthProfile mapProfile(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            String email = stringValue(attributes.get("email"));
            String firstName = stringValue(attributes.get("given_name"));
            String lastName = stringValue(attributes.get("family_name"));
            String providerId = stringValue(attributes.get("sub"));

            return new OAuthProfile(providerId, email, firstName, lastName);
        }

        String email = stringValue(attributes.get("email"));
        String login = stringValue(attributes.get("login"));
        String name = stringValue(attributes.get("name"));
        String providerId = stringValue(attributes.get("id"));

        if (email == null || email.isBlank()) {
            String fallback = login == null || login.isBlank() ? "github-user" : login;
            email = fallback + "@users.noreply.github.com";
        }

        NameParts nameParts = splitName(name == null || name.isBlank() ? login : name);

        return new OAuthProfile(providerId, email, nameParts.firstName, nameParts.lastName);
    }

    private NameParts splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new NameParts("User", "");
        }

        String trimmed = fullName.trim();
        String[] parts = trimmed.split("\\s+", 2);
        if (parts.length == 1) {
            return new NameParts(parts[0], "");
        }

        return new NameParts(parts[0], parts[1]);
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private record OAuthProfile(String providerId, String email, String firstName, String lastName) {}

    private record NameParts(String firstName, String lastName) {}
}
