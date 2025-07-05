package in.edu.ssn.hostel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import in.edu.ssn.hostel.model.Category;
import in.edu.ssn.hostel.service.categoryService;

@RestController
@CrossOrigin

public class categoryController {

    @Autowired
    categoryService service;

    @PostMapping("/save-category")
    public ResponseEntity<Category> savecategory(@RequestBody String s) {
        System.out.println(s);
        Category output = service.saveCategory(s);
        return ResponseEntity.ok(output);
    }
;

}
