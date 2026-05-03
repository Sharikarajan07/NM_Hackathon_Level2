package com.ticketing.auth.oauth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${auth.oauth.frontend-redirect-url:http://localhost:3000/oauth-success}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {
        String provider = extractProvider(request.getRequestURI());
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("error", "oauth_unregistered")
                .queryParam("provider", provider)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private String extractProvider(String requestUri) {
        if (requestUri == null || requestUri.isBlank()) {
            return "oauth";
        }
        int lastSlash = requestUri.lastIndexOf('/');
        if (lastSlash == -1 || lastSlash == requestUri.length() - 1) {
            return "oauth";
        }
        return requestUri.substring(lastSlash + 1);
    }
}
