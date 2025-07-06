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
}
