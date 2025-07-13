package in.edu.ssn.hostel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import in.edu.ssn.hostel.service.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for OAuth2
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/api/user-info", "/styles.css", "/scripts/**", "/src/**").permitAll()
                .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService())
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
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }
}
