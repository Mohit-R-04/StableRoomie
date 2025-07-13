package in.edu.ssn.hostel.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/admin/dashboard")
    public String adminDashboard(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return "redirect:/login";
        }
        
        String role = (String) principal.getAttribute("role");
        if (!"ADMIN".equals(role)) {
            return "redirect:/login";
        }
        
        return "index"; // This will serve the index.html template
    }

    @GetMapping("/student/dashboard")
    public String studentDashboard(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return "redirect:/login";
        }
        
        String role = (String) principal.getAttribute("role");
        if (!"STUDENT".equals(role)) {
            return "redirect:/login";
        }
        
        return "index"; // This will serve the index.html template
    }
} 