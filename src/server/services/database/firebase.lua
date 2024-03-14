--== Variables;
local HttpService = game:GetService("HttpService");
local DataStoreService = game:GetService("DataStoreService");
local FirebaseInfo = DataStoreService:GetDataStore("FirebaseInfo");

--== Configuration;
local defaultDatabase = FirebaseInfo:GetAsync("DB_URL"); -- Set your database link
local authenticationToken = FirebaseInfo:GetAsync("DB_AUTH"); -- Authentication Token

local FirebaseService = {};
local UseFirebase = true;

--== Script;

function FirebaseService:useFirebase(use)
	UseFirebase = use;
end

function FirebaseService:fetch(name, database)
	database = database or defaultDatabase;
	local datastore = DataStoreService:GetDataStore(name);
	local databaseName = database..HttpService:UrlEncode(name);
	local authentication = ".json?auth="..authenticationToken;
	local Firebase = {};

	function Firebase:getDatastore()
		return datastore;
	end

	function Firebase:get(directory)
		--== Firebase Get;
		local data;
		local endpoint = databaseName..HttpService:UrlEncode(directory and "/"..directory or "")..authentication;
		local tries = 0; repeat until pcall(function()
			tries += 1;
			data = HttpService:GetAsync(endpoint, true);
		end) or tries > 2;
		return if data ~= nil then HttpService:JSONDecode(data) else nil;
	end

	function Firebase:set(directory, value, headers)
		if not UseFirebase then return end
		if value == "[]" then self:delete(directory); return end;

		--== Firebase Set;
		headers = headers or {["X-HTTP-Method-Override"]="PUT"};
		local replyJson = "";
		local endpoint = databaseName..HttpService:UrlEncode(directory and "/"..directory or "")..authentication;
		local success, errorMessage = pcall(function()
			replyJson = HttpService:PostAsync(
				endpoint, HttpService:JSONEncode(value),
				Enum.HttpContentType.ApplicationUrlEncoded, false, headers
			);
		end);
		if not success then
			warn("[Firebase] Error: "..errorMessage);
			pcall(function()
				replyJson = HttpService:JSONDecode(replyJson or "[]");
			end)
		end
	end

	function Firebase:delete(directory)
		if not UseFirebase then return end
		self:set(directory, nil, {["X-HTTP-Method-Override"]="DELETE"});
	end

	function Firebase:increment(directory, delta)
		delta = delta or 1;
		if type(delta) ~= "number" then warn("[Firebase] Error: Increment delta is not a number for key ("..directory.."), delta(",delta,")"); return end;
		local data = self:get(directory) or 0;
		if data and type(data) == "number" then
			data += delta;
			self:set(directory, data);
		else
			warn("[Firebase] Error: Invalid data type to increment for key ("..directory..")");
		end
		return data;
	end

	function Firebase:update(directory, callback)
		local data = self:get(directory);
		local callbackData = callback(data);
		if callbackData then
			self:set(directory, callbackData);
		end
	end

	return Firebase;
end

return FirebaseService;