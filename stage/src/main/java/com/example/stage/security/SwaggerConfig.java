package com.example.stage.security;

/*import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;*/
import org.springframework.context.annotation.Configuration;

@Configuration
/*@OpenAPIDefinition(
        info = @Info(
                title = "Stage API",
                version = "1.0",
                description = "Documentation de l'API Stage"
        ),
        security = @SecurityRequirement(name = "bearerAuth") // 🔥 active la sécurité globale
)
@SecurityScheme(
        name = "bearerAuth", // doit correspondre au nom du security requirement
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)*/
public class SwaggerConfig { }
