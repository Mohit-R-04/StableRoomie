package in.edu.ssn.hostel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication

public class HostelAllotmentApplication {
    public static void main(String[] args) {
        SpringApplication.run(HostelAllotmentApplication.class, args);
    }
}
