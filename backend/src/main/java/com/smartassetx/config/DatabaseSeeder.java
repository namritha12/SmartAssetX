package com.smartassetx.config;

import com.smartassetx.entity.*;
import com.smartassetx.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          CategoryRepository categoryRepository,
                          AssetRepository assetRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.assetRepository = assetRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // If users already exist, check and update the seed account names, then return
        if (userRepository.count() > 0) {
            userRepository.findByEmail("admin@smartassetx.com").ifPresent(u -> {
                u.setFullName("Alex");
                userRepository.save(u);
            });
            userRepository.findByEmail("manager@smartassetx.com").ifPresent(u -> {
                u.setFullName("Namritha");
                userRepository.save(u);
            });
            userRepository.findByEmail("employee@smartassetx.com").ifPresent(u -> {
                u.setFullName("Lala");
                userRepository.save(u);
            });
            return;
        }

        System.out.println(">>> SmartAssetX: Seeding database with demo data...");

        // 1. Seed Departments
        List<Department> departments = new ArrayList<>();
        departments.add(departmentRepository.save(new Department(null, "IT & Infrastructure", "Handles corporate technology services")));
        departments.add(departmentRepository.save(new Department(null, "Human Resources", "Focuses on recruitment and talent support")));
        departments.add(departmentRepository.save(new Department(null, "Finance & Accounts", "Manages financial resources and bookkeeping")));
        departments.add(departmentRepository.save(new Department(null, "Engineering", "Core software development and operations")));

        Department itDept = departments.get(0);
        Department hrDept = departments.get(1);

        // 2. Seed Categories
        List<Category> categories = new ArrayList<>();
        categories.add(categoryRepository.save(new Category(null, "Laptop")));
        categories.add(categoryRepository.save(new Category(null, "Desktop")));
        categories.add(categoryRepository.save(new Category(null, "Monitor")));
        categories.add(categoryRepository.save(new Category(null, "Keyboard")));
        categories.add(categoryRepository.save(new Category(null, "Mouse")));
        categories.add(categoryRepository.save(new Category(null, "Printer")));
        categories.add(categoryRepository.save(new Category(null, "Projector")));

        Category laptopCat = categories.get(0);
        Category monitorCat = categories.get(2);

        // 3. Seed Users
        // Admin
        User admin = User.builder()
                .employeeId("EMP001")
                .fullName("Alex")
                .email("admin@smartassetx.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+1 234 567 890")
                .designation("IT Admin Manager")
                .role(Role.ADMIN)
                .status("ACTIVE")
                .department(itDept)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(admin);

        // Manager
        User manager = User.builder()
                .employeeId("EMP002")
                .fullName("Namritha")
                .email("manager@smartassetx.com")
                .password(passwordEncoder.encode("manager123"))
                .phone("+1 234 567 891")
                .designation("IT Delivery Lead")
                .role(Role.MANAGER)
                .status("ACTIVE")
                .department(itDept)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(manager);

        // Employee
        User employee = User.builder()
                .employeeId("EMP003")
                .fullName("Lala")
                .email("employee@smartassetx.com")
                .password(passwordEncoder.encode("employee123"))
                .phone("+1 234 567 892")
                .designation("Associate Software Engineer")
                .role(Role.EMPLOYEE)
                .status("ACTIVE")
                .department(itDept)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(employee);

        // Additional Manager and Employee in HR for testing
        User hrManager = User.builder()
                .employeeId("EMP004")
                .fullName("Jane Smith")
                .email("hrmanager@smartassetx.com")
                .password(passwordEncoder.encode("manager123"))
                .phone("+1 234 567 893")
                .designation("HR Lead")
                .role(Role.MANAGER)
                .status("ACTIVE")
                .department(hrDept)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(hrManager);

        User hrEmployee = User.builder()
                .employeeId("EMP005")
                .fullName("Alice Cooper")
                .email("hremployee@smartassetx.com")
                .password(passwordEncoder.encode("employee123"))
                .phone("+1 234 567 894")
                .designation("HR Executive")
                .role(Role.EMPLOYEE)
                .status("ACTIVE")
                .department(hrDept)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(hrEmployee);

        // 4. Seed Assets
        // Available Assets
        Asset laptop1 = Asset.builder()
                .assetCode("AST-LAP-001")
                .assetName("Dell Latitude 5420")
                .serialNumber("DELL5420S1")
                .brand("Dell")
                .model("Latitude 5420")
                .purchaseDate(LocalDate.now().minusMonths(12))
                .purchaseCost(new BigDecimal("1200.00"))
                .warrantyExpiry(LocalDate.now().plusMonths(24))
                .amcExpiry(LocalDate.now().plusMonths(12))
                .status("Available")
                .category(laptopCat)
                .build();
        assetRepository.save(laptop1);

        Asset laptop2 = Asset.builder()
                .assetCode("AST-LAP-002")
                .assetName("MacBook Pro M2")
                .serialNumber("APPLEMP2S1")
                .brand("Apple")
                .model("MacBook Pro M2 14\"")
                .purchaseDate(LocalDate.now().minusMonths(6))
                .purchaseCost(new BigDecimal("2199.00"))
                .warrantyExpiry(LocalDate.now().plusMonths(6)) // Expiring in 6 months for testing
                .amcExpiry(LocalDate.now().plusMonths(18))
                .status("Available")
                .category(laptopCat)
                .build();
        assetRepository.save(laptop2);

        Asset monitor1 = Asset.builder()
                .assetCode("AST-MON-001")
                .assetName("LG UltraWide 34\"")
                .serialNumber("LG34UW001")
                .brand("LG")
                .model("34WN80C-B")
                .purchaseDate(LocalDate.now().minusMonths(18))
                .purchaseCost(new BigDecimal("550.00"))
                .warrantyExpiry(LocalDate.now().plusMonths(18))
                .amcExpiry(LocalDate.now().plusMonths(6)) // Expiring in 6 months for testing
                .status("Available")
                .category(monitorCat)
                .build();
        assetRepository.save(monitor1);

        // Maintenance Asset
        Asset monitor2 = Asset.builder()
                .assetCode("AST-MON-002")
                .assetName("Dell 24\" Monitor")
                .serialNumber("DELL24M002")
                .brand("Dell")
                .model("P2419H")
                .purchaseDate(LocalDate.now().minusMonths(24))
                .purchaseCost(new BigDecimal("200.00"))
                .warrantyExpiry(LocalDate.now().minusMonths(12)) // Expired
                .amcExpiry(LocalDate.now().minusMonths(6))      // Expired
                .status("Maintenance")
                .category(monitorCat)
                .build();
        assetRepository.save(monitor2);

        System.out.println(">>> SmartAssetX: Seeding completed successfully!");
    }
}
