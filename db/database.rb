default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  host: localhost

development:
  <<: *default
  database: test
  username: root
  password: root@1234
  
test:
  <<: *default
  database: test

# production:
#   adapter: postgresql
#   encoding: unicode
#   database: <%= ENV.fetch("RDS_DB_NAME") { "" } %>
#   username: <%= ENV.fetch("RDS_USERNAME") { "" } %>
#   password: <%= ENV.fetch("RDS_PASSWORD") { "" } %>
#   host: <%= ENV.fetch("RDS_HOSTNAME") { "" } %>
#   port: <%= 5432 %>
#   pool: <%= ENV.fetch("RDS_POOL") { "5" }%>
