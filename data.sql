DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

INSERT INTO companies 
  (handle, name, num_employees, description) 
VALUES 
  ('ibm', 'IBM', 10000, 'Big computer company'),
  ('dell', 'DELL', 5000, 'Another big computer company'),
  ('mcd', 'McDonalds', 100000, 'Burger place'),
  ('rose_rocket', 'Rose Rocket', 50, 'Logistics software company');