namespace :build do
  desc "Build Chrome extension as a zip"
  task :chrome do
    require 'json'
    manifest = JSON.parse(IO.read("manifest.json"))
    sha = `git log --quiet --pretty=format:%h -n1 HEAD`
    files = Array.new
    %w{data/chrome/**/* data/shared/**/* data/images/**/*}.each do |glob|
      files = files + Dir.glob(glob)
    end
    files.push("manifest.json")

    zip_name = "flattr-chrome-extension-v#{manifest["version"]}-#{sha}.zip"
    `zip #{zip_name} #{files.join(" ")}`
    puts "Flattr Chrome Extension #{zip_name} built..."

  end
end
