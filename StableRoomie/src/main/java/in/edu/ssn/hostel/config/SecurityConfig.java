package in.edu.ssn.hostel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import in.edu.ssn.hostel.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CustomOAuth2UserService customOAuth2UserService) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for OAuth2
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/api/user-info", "/error", "/favicon.ico",
                        "/styles.css", "/scripts/**", "/src/**").permitAll()
                .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl("/process", true)
                .failureUrl("/login?error=domain")
                )
                .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

    @Bean
    public org.springframework.web.client.RestTemplate restTemplate() {
        return new org.springframework.web.client.RestTemplate();
    }
}
