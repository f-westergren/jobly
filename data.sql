DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL,
  company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO companies 
  (handle, name, num_employees, description) 
VALUES 
  ('ibm', 'IBM', 10000, 'Big computer company'),
  ('dell', 'DELL', 5000, 'Another big computer company'),
  ('mcd', 'McDonalds', 100000, 'Burger place'),
  ('rose_rocket', 'Rose Rocket', 50, 'Logistics software company');

INSERT INTO jobs
  (title, salary, equity, company_handle)
VALUES
  ('Software Engineer', 80000, 0, 'ibm'),
  ('Full Stack Developer', 100000, 0.2, 'rose_rocket'),
  ('Cashier', 20000, 0, 'mcd');