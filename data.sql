CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);


{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRhdmlkIiwiaWF0IjoxNTgxOTc3MzE0fQ.9wYf8jwc527hLqAr09-HbYhzB67WQ27ItQTt0Uj17hY"
}

{
  "error": {
    "name": "error",
    "length": 190,
    "severity": "ERROR",
    "code": "23505",
    "detail": "Key (username)=(david) already exists.",
    "schema": "public",
    "table": "users",
    "constraint": "users_pkey",
    "file": "nbtinsert.c",
    "line": "570",
    "routine": "_bt_check_unique"
  }
}

{
  "error": {
    "name": "error",
    "length": 320,
    "severity": "ERROR",
    "code": "23502",
    "detail": "Failing row contains (dav, $2b$12$yrBSpzScQku5W4xXUCqk6u95bmc32WPQqYQ2NlCt8ZgpRm218Jahe, null, null, null, 2020-02-17 14:10:07.788721, 2020-02-17 14:10:07.788721-08).",
    "schema": "public",
    "table": "users",
    "column": "first_name",
    "file": "execMain.c",
    "line": "1974",
    "routine": "ExecConstraints"
  }
}