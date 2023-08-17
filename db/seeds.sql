USE employee_management;

INSERT INTO department (name) VALUES
('HR'),
('Finance'),
('Engineering');

INSERT INTO role (title, salary, department_id) VALUES
('Manager', 80000, 1),
('Accountant', 60000, 2),
('Software Engineer', 75000, 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Mike', 'Johnson', 3, 1);
