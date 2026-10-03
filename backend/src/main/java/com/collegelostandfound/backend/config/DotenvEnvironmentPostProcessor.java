package com.collegelostandfound.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads environment variables from the project root `.env` file into Spring's Environment
 * during application startup and test execution if present.
 *
 * Checks both the current directory and the parent directory so that running from
 * either the project root or the backend/ directory works seamlessly.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Dotenv dotenv = null;

        File currentDirEnv = new File(".env");
        File parentDirEnv = new File("../.env");

        if (currentDirEnv.exists() && currentDirEnv.isFile()) {
            dotenv = Dotenv.configure().directory("./").ignoreIfMissing().load();
        } else if (parentDirEnv.exists() && parentDirEnv.isFile()) {
            dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();
        } else {
            dotenv = Dotenv.configure().ignoreIfMissing().load();
        }

        if (dotenv != null) {
            Map<String, Object> envMap = new HashMap<>();
            for (DotenvEntry entry : dotenv.entries()) {
                envMap.put(entry.getKey(), entry.getValue());
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            }
            if (!envMap.isEmpty()) {
                environment.getPropertySources().addLast(new MapPropertySource("dotenvProperties", envMap));
            }
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
