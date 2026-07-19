package com.smartassetx.security;

import com.smartassetx.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    public SecurityConfig(AuthEntryPointJwt unauthorizedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserRepository userRepository) {
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userRepository = userRepository;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                
                // Categories & Departments (GET allowed for authenticated, other methods Admin-only)
                .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/departments/**").authenticated()
                .requestMatchers("/api/categories/**", "/api/departments/**").hasRole("ADMIN")
                
                // Assets (GET allowed for authenticated, other methods Admin-only)
                .requestMatchers(HttpMethod.GET, "/api/assets/**").authenticated()
                .requestMatchers("/api/assets/**").hasRole("ADMIN")
                
                // Assignments (Assign Admin-only, others authenticated)
                .requestMatchers("/api/assignments/assign").hasRole("ADMIN")
                .requestMatchers("/api/assignments/**").authenticated()
                
                // Requests (Approve/Reject Manager-only, requests/my employee-only, requests admin-only, requests pending manager/admin)
                .requestMatchers("/api/requests/*/approve", "/api/requests/*/reject").hasRole("MANAGER")
                .requestMatchers("/api/requests/pending").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers("/api/requests/my").hasRole("EMPLOYEE")
                .requestMatchers(HttpMethod.POST, "/api/requests").hasRole("EMPLOYEE")
                .requestMatchers(HttpMethod.GET, "/api/requests").hasRole("ADMIN")
                .requestMatchers("/api/requests/**").authenticated()
                
                // Reports & Dashboards
                .requestMatchers("/api/reports/dashboard").authenticated()
                .requestMatchers("/api/reports/**").authenticated() 
                
                // Notifications
                .requestMatchers("/api/notifications/**").authenticated()
                
                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
