CREATE DATABASE Videorent;
USE Videorent;

-- Table "Tapes"
CREATE TABLE Tapes (
                       tape_id INT PRIMARY KEY AUTO_INCREMENT,
                       cost DECIMAL(10, 2) NOT NULL
);

-- Table "Genre"
CREATE TABLE Genre (
                       genre_id INT PRIMARY KEY AUTO_INCREMENT,
                       name VARCHAR(50) NOT NULL
);

-- Table "FilmDatabase"
CREATE TABLE FilmDatabase (
                              film_id INT PRIMARY KEY AUTO_INCREMENT,
                              film_name VARCHAR(100) NOT NULL,
                              rating INT,
                              genre_id INT,
                              tape_id INT,
                              FOREIGN KEY (tape_id) REFERENCES Tapes(tape_id),
                              FOREIGN KEY (genre_id) REFERENCES Genre(genre_id)
);

-- Table "Status"
CREATE TABLE Status (
                        status_id INT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(50) NOT NULL
);

-- Table "Clients"
CREATE TABLE Clients (
                         client_id INT PRIMARY KEY AUTO_INCREMENT,
                         full_name VARCHAR(100) NOT NULL,
                         email VARCHAR(100),
                         phone VARCHAR(15),
                         status_id INT,
                         FOREIGN KEY (status_id) REFERENCES Status(status_id)
);

-- Table "Violations"
CREATE TABLE Violations (
                            violation_id INT PRIMARY KEY AUTO_INCREMENT,
                            fine DECIMAL(10, 2) NOT NULL
);

-- Table "Rental"
CREATE TABLE Rental (
                        rental_id INT PRIMARY KEY AUTO_INCREMENT,
                        client_id INT NOT NULL,
                        tape_id INT NOT NULL,
                        service_date VARCHAR(45) NOT NULL,
                        expected_return_date VARCHAR(45) NOT NULL,
                        return_date VARCHAR(45),
                        violation_id INT,
                        FOREIGN KEY (client_id) REFERENCES Clients(client_id),
                        FOREIGN KEY (tape_id) REFERENCES Tapes(tape_id),
                        FOREIGN KEY (violation_id) REFERENCES Violations(violation_id)
);

-- Inserting data into "Tapes"
INSERT INTO Tapes (tape_id, cost) VALUES
                                      (1, 150.00),
                                      (2, 200.00),
                                      (3, 175.00),
                                      (4, 300.00),
                                      (5, 250.00),
                                      (6, 100.00),
                                      (7, 125.00),
                                      (8, 350.00),
                                      (9, 400.00),
                                      (10, 225.00);

-- Inserting data into "Genre"
INSERT INTO Genre (genre_id, name) VALUES
                                       (1, 'Comedy'),
                                       (2, 'Drama'),
                                       (3, 'Action'),
                                       (4, 'Sci-Fi'),
                                       (5, 'Romance'),
                                       (6, 'Horror'),
                                       (7, 'Thriller'),
                                       (8, 'Detective'),
                                       (9, 'Adventure'),
                                       (10, 'Animation');

-- Inserting data into "FilmDatabase"
INSERT INTO FilmDatabase (film_id, film_name, rating, genre_id, tape_id) VALUES
                                                                             (1, 'Film 1', 8, 1, 1),
                                                                             (2, 'Film 2', 7, 2, 2),
                                                                             (3, 'Film 3', 9, 3, 3),
                                                                             (4, 'Film 4', 6, 4, 4),
                                                                             (5, 'Film 5', 8, 5, 5),
                                                                             (6, 'Film 6', 7, 6, 6),
                                                                             (7, 'Film 7', 9, 7, 7),
                                                                             (8, 'Film 8', 8, 8, 8),
                                                                             (9, 'Film 9', 6, 9, 9),
                                                                             (10, 'Film 10', 7, 10, 10);

-- Inserting data into "Status"
INSERT INTO Status (status_id, name) VALUES
                                         (1, 'Active'),
                                         (2, 'Inactive'),
                                         (3, 'Blocked'),
                                         (4, 'Pending'),
                                         (5, 'New'),
                                         (6, 'VIP'),
                                         (7, 'Blacklist'),
                                         (8, 'Regular'),
                                         (9, 'Deleted'),
                                         (10, 'Archived');

-- Inserting data into "Clients"
INSERT INTO Clients (client_id, full_name, email, phone, status_id) VALUES
                                                                        (1, 'Ivan Ivanov', 'ivanov@mail.com', '89001234567', 1),
                                                                        (2, 'Petr Petrov', 'petrov@mail.com', '89007654321', 2),
                                                                        (3, 'Sidor Sidorov', 'sidorov@mail.com', '89004561234', 3),
                                                                        (4, 'Mikhail Kuznetsov', 'kuznetsov@mail.com', '89009876543', 4),
                                                                        (5, 'Alexey Smirnov', 'smirnov@mail.com', '89006543210', 5),
                                                                        (6, 'Anna Popova', 'popova@mail.com', '89003215476', 6),
                                                                        (7, 'Elena Morozova', 'morozova@mail.com', '89002345167', 7),
                                                                        (8, 'Vasily Vasiliev', 'vasiliev@mail.com', '89001122334', 8),
                                                                        (9, 'Alexander Alexandrov', 'alexandrov@mail.com', '89005566778', 9),
                                                                        (10, 'Olga Nikolaeva', 'nikolaeva@mail.com', '89004455667', 10);

-- Inserting data into "Violations"
INSERT INTO Violations (violation_id, fine) VALUES
                                                (1, 50.00),
                                                (2, 100.00),
                                                (3, 150.00),
                                                (4, 200.00),
                                                (5, 250.00),
                                                (6, 300.00),
                                                (7, 350.00),
                                                (8, 400.00),
                                                (9, 450.00),
                                                (10, 500.00);

-- Inserting data into "Rental"
INSERT INTO Rental (rental_id, client_id, tape_id, service_date, expected_return_date, return_date, violation_id) VALUES
                                                                                                                      (1, 1, 1, '2024-11-01', '2024-11-08', NULL, NULL),
                                                                                                                      (2, 2, 2, '2024-11-02', '2024-11-09', '2024-11-08', 1),
                                                                                                                      (3, 3, 3, '2024-11-03', '2024-11-10', '2024-11-11', 2),
                                                                                                                      (4, 4, 4, '2024-11-04', '2024-11-11', NULL, NULL),
                                                                                                                      (5, 5, 5, '2024-11-05', '2024-11-12', '2024-11-13', 3),
                                                                                                                      (6, 6, 6, '2024-11-06', '2024-11-13', NULL, NULL),
                                                                                                                      (7, 7, 7, '2024-11-07', '2024-11-14', '2024-11-15', 4),
                                                                                                                      (8, 8, 8, '2024-11-08', '2024-11-15', '2024-11-16', 5),
                                                                                                                      (9, 9, 9, '2024-11-09', '2024-11-16', '2024-11-17', 6),
                                                                                                                      (10, 10, 10, '2024-11-10', '2024-11-17', NULL, NULL);
