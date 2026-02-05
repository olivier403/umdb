package com.umdb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class UmdbApplication {
    public static void main(String[] args) {
        SpringApplication.run(UmdbApplication.class, args);
    }
}
