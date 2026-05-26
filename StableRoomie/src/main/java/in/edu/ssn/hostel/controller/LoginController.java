package in.edu.ssn.hostel.controller;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    @GetMapping({"/", "/login"})
    public String loginPage() {
        // Serve the custom login page (index.html in templates)
        return "index";
    }

    @GetMapping("/error")
    public String errorPage() {
        return "redirect:/login?error=oauth";
    }

    @GetMapping("/dev-login")
    public String devLogin(@RequestParam("role") String role, HttpServletRequest request) {
        Map<String, Object> attributes = new HashMap<>();
        if ("ADMIN".equals(role.toUpperCase())) {
            attributes.put("email", "mohit.official04091k@gmail.com");
            attributes.put("name", "Dev Admin");
            attributes.put("role", "ADMIN");
        } else {
            attributes.put("email", "student.test@ssn.edu.in");
            attributes.put("name", "Dev Student");
            attributes.put("role", "STUDENT");
        }

        org.springframework.security.core.authority.SimpleGrantedAuthority authority = 
            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER");
        
        OAuth2User principal = new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
            Collections.singleton(authority),
            attributes,
            "email"
        );

        org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken token = 
            new org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken(
                principal,
                Collections.singleton(authority),
                "google"
            );

        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(token);
        
        request.getSession(true).setAttribute(
            org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            org.springframework.security.core.context.SecurityContextHolder.getContext()
        );

        return "redirect:/process";
    }

    @RequestMapping("/process")
    public void processLogin(@AuthenticationPrincipal OAuth2User principal, HttpServletResponse response) throws IOException {
        if (principal == null) {
            response.sendRedirect("/login");
            return;
        }
        String role = (String) principal.getAttribute("role");
        if ("ADMIN".equals(role)) {
            response.sendRedirect("/admin/dashboard");
        } else {
            response.sendRedirect("/student/dashboard");
        }
    }

    @GetMapping("/api/user-info")
    @ResponseBody
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> userInfo = new HashMap<>();
        
        if (principal != null) {
            userInfo.put("authenticated", true);
            userInfo.put("email", principal.getAttribute("email"));
            userInfo.put("name", principal.getAttribute("name"));
            userInfo.put("role", principal.getAttribute("role"));
        } else {
            userInfo.put("authenticated", false);
        }
        
        return userInfo;
    }

    @GetMapping("/logout")
    public String logout(HttpServletRequest request, HttpServletResponse response) {
        // Invalidate the session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        // Clear any cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                cookie.setValue("");
                cookie.setPath("/");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
            }
        }
        
        return "redirect:/";
    }
} 