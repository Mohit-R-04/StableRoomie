package in.edu.ssn.hostel.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.edu.ssn.hostel.model.Category;
import in.edu.ssn.hostel.repo.categoryRepo;

@Service
public class categoryService {

    @Autowired
    categoryRepo repo;

    public Category saveCategory(String category) {
        Category c = new Category();
        c.setCategory(category);
        repo.save(c);
        return c;
    }

    public List<Category> getCategory() {
        return repo.findAll();
    }

    public void deleteCategory(Long id) {
        repo.deleteById(id);
    }

    @jakarta.annotation.PostConstruct
    public void initDefaultCategories() {
        if (repo.count() == 0) {
            String[] defaultCats = {"ssn-CSE-1st", "ssn-CSE-2nd", "ssn-ECE-1st", "ssn-ECE-2nd", "ssn-IT-1st", "ssn-IT-2nd"};
            for (String cat : defaultCats) {
                Category c = new Category();
                c.setCategory(cat);
                repo.save(c);
            }
        }
    }
}
