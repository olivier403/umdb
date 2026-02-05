package com.umdb.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.umdb.model.User;
import com.umdb.support.PostgresTestContainerConfig;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest extends PostgresTestContainerConfig {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void findByEmailIgnoreCaseMatchesRegardlessOfCase() {
        User user = User.builder()
            .name("Casey")
            .email("Casey@Example.com")
            .passwordHash("hash")
            .build();

        userRepository.save(user);

        Optional<User> found = userRepository.findByEmailIgnoreCase("casey@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("Casey@Example.com");
        assertThat(found.get().getCreatedAt()).isNotNull();
    }

    @Test
    void existsByEmailIgnoreCaseReportsPresence() {
        User user = User.builder()
            .name("Jordan")
            .email("Jordan@Example.com")
            .passwordHash("hash")
            .build();

        userRepository.save(user);

        assertThat(userRepository.existsByEmailIgnoreCase("jordan@example.com")).isTrue();
        assertThat(userRepository.existsByEmailIgnoreCase("missing@example.com")).isFalse();
    }
}
