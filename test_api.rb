require "base64"
require 'faraday'

conn = Faraday.new(:url => 'http://52.32.151.49/') do |faraday|
    faraday.response :logger
    # faraday.headers['X-API-Auth'] = Base64.strict_encode64('jsonrpc:6c50ee6b032d0d4583f4c51ace0376a116526d1be033d8c7ec475fb35d3d')     # base64_encode('jsonrpc:API_KEY')
    faraday.adapter Faraday.default_adapter    # make requests with Net::HTTP
    faraday.basic_auth('admin', 'admin')
end
# 
response = conn.post do |req|
    req.url '/jsonrpc.php'
    req.headers['Content-Type'] = 'application/json'
    # req.headers['API_AUTHENTICATION_HEADER'] = "X-API-Auth"

    # req.body = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": "133280317"}';

    # req.body = '{ "jsonrpc": "2.0", "method": "createTask", "id": 226760253, "params": { "title": "PHP client", "project_id": 1 }}'
    # req.body = '{ "jsonrpc": "2.0", "method": "getAllFiles", "id": 226760253, "params": { "task_id": 1 }}'
    # req.body = '{ "jsonrpc": "2.0", "method": "getAllUsers", "id": 226760253}'
    req.body = '{ "jsonrpc": "2.0", "method": "getAllComments", "id": 226760253, "params": { "task_id": 3 }}'

    # req.body = '{"jsonrpc": "2.0","method": "getAllTasks", "id": 133280317, "params": {"project_id": 1,"status_id": 1}}'
end

puts response.body
