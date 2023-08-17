const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'marcelo',
  database: 'employee_management'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
    startApp();
  }
});

function startApp() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'menuChoice',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      }
    ])
    .then(answer => {
      switch (answer.menuChoice) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          console.log('Goodbye!');
          connection.end();
          break;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function viewDepartments() {
  connection.query('SELECT * FROM department', (err, results) => {
    if (err) {
      console.error('Error querying departments:', err);
    } else {
      console.log('\n');
      console.table(results);
      console.log('\n');
      startApp();
    }
  });
}

function viewRoles() {
  connection.query('SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id', (err, results) => {
    if (err) {
      console.error('Error querying roles:', err);
    } else {
      console.log('\n');
      console.table(results);
      console.log('\n');
      startApp();
    }
  });
}

function viewEmployees() {
  connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id', (err, results) => {
    if (err) {
      console.error('Error querying employees:', err);
    } else {
      console.log('\n');
      console.table(results);
      console.log('\n');
      startApp();
    }
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the new department:'
      }
    ])
    .then(answer => {
      connection.query(
        'INSERT INTO department (name) VALUES (?)',
        [answer.departmentName],
        (err, result) => {
          if (err) {
            console.error('Error adding department:', err);
          } else {
            console.log('Department added successfully!');
            startApp();
          }
        }
      );
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the new role:'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the new role:'
      },
      {
        type: 'input',
        name: 'departmentId',
        message: 'Enter the department ID for the new role:'
      }
    ])
    .then(answer => {
      connection.query(
        'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
        [answer.title, answer.salary, answer.departmentId],
        (err, result) => {
          if (err) {
            console.error('Error adding role:', err);
          } else {
            console.log('Role added successfully!');
            startApp();
          }
        }
      );
    });
}

function addEmployee() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter the first name of the new employee:'
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter the last name of the new employee:'
      },
      {
        type: 'input',
        name: 'roleId',
        message: 'Enter the role ID for the new employee:'
      },
      {
        type: 'input',
        name: 'managerId',
        message: 'Enter the manager ID for the new employee:'
      }
    ])
    .then(answer => {
      connection.query(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
        [answer.firstName, answer.lastName, answer.roleId, answer.managerId],
        (err, result) => {
          if (err) {
            console.error('Error adding employee:', err);
          } else {
            console.log('Employee added successfully!');
            startApp();
          }
        }
      );
    });
}

function updateEmployeeRole() {
 
  const employeeList = [];
  const roleList = [];

 
  connection.query('SELECT id, first_name, last_name FROM employee', (err, employees) => {
    if (err) {
      console.error('Error fetching employees:', err);
    } else {
      employeeList.push(...employees);

      
      connection.query('SELECT id, title FROM role', (err, roles) => {
        if (err) {
          console.error('Error fetching roles:', err);
        } else {
          roleList.push(...roles);

          inquirer
            .prompt([
              {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to update:',
                choices: employeeList.map(employee => ({
                  name: `${employee.first_name} ${employee.last_name}`,
                  value: employee.id
                }))
              },
              {
                type: 'list',
                name: 'newRoleId',
                message: 'Select the new role for the employee:',
                choices: roleList.map(role => ({
                  name: role.title,
                  value: role.id
                }))
              }
            ])
            .then(answer => {
              connection.query(
                'UPDATE employee SET role_id = ? WHERE id = ?',
                [answer.newRoleId, answer.employeeId],
                (err, result) => {
                  if (err) {
                    console.error('Error updating employee role:', err);
                  } else {
                    console.log('Employee role updated successfully!');
                    startApp();
                  }
                }
              );
            });
        }
      });
    }
  });
}
