package com.ticketing.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class OAuthController {

    @GetMapping("/api/auth/oauth2/authorize/{provider}")
    public String redirectToProvider(@PathVariable String provider) {
        return "redirect:/oauth2/authorization/" + provider;
    }
}
