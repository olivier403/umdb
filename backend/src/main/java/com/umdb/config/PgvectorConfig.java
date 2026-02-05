package com.umdb.config;

import com.pgvector.PGvector;
import java.sql.Connection;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class PgvectorConfig {

    @Bean
    public ApplicationRunner pgvectorTypeInitializer(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                PGvector.addVectorType(connection);
                log.info("PGvector type registered");
            }
        };
    }
}
