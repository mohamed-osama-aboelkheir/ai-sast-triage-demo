CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  api_token TEXT UNIQUE NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE VIEW orders_daily_summary AS
  SELECT * FROM orders WHERE created_at >= now() - interval '1 day';

CREATE VIEW orders_monthly_summary AS
  SELECT * FROM orders WHERE created_at >= date_trunc('month', now());

INSERT INTO users (username, role, api_token) VALUES
  ('alice', 'user',  'tok_alice_7d2f9c'),
  ('bob',   'user',  'tok_bob_3a8e1b'),
  ('admin', 'admin', 'tok_admin_c41f6e');

INSERT INTO orders (user_id, total, status, created_at) VALUES
  (1,  42.50, 'open',      now() - interval '2 hours'),
  (1, 120.00, 'shipped',   now() - interval '3 days'),
  (1,  15.99, 'cancelled', now() - interval '10 days'),
  (2, 310.00, 'shipped',   now() - interval '5 hours'),
  (2,  75.25, 'open',      now() - interval '20 days');

INSERT INTO comments (user_id, body) VALUES
  (1, 'Delivery was **fast**, thanks! Tracking: [carrier site](https://example.com/track)'),
  (2, 'Package arrived damaged <img src=x onerror="alert(document.domain)">'),
  (1, '- item one arrived\n- item two is `backordered`');
