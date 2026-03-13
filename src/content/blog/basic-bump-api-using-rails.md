---
title: "Basic \"bump\" API using Rails"
description: "A protocol to link mobile devices through device bumping, a technique that requires accurate device geolocation."
pubDate: 2016-01-02
updatedDate: 2018-06-04
#heroImage: "/content/images/2016/01/bump_post_header.jpg"
tags: ["development","rails","ruby","API"]
---

This post will show how to create a basic "bump" API, it does have several shortcomings but will demonstrate the essential components required to get started. The code can be found on [github.](https://github.com/monkey-codes/rails-bump-protocol)

## How does bump work?

The basic operation of the bump protocol breaks down into 2 parts an app running on a mobile device capable of sensing a "**bump**" using its sensors and a server that receives these bump events via some mechanism like an API. In the event of a bump the device sends basic information like device id and coordinates to a server. The server in turn uses an algorithm to match the bump to other recent bump events in the vicinity of the received bump and proceeds to pair up the devices. This post will focus on the server part of the protocol.

## Environment

System requirements include:

*   [rvm](https://rvm.io/)
*   [ruby](https://www.ruby-lang.org/en/)
*   [rails](http://rubyonrails.org/)
*   [postgres](http://www.postgresql.org/)
*   [postGIS](http://postgis.net/)

### Rvm, Ruby & Rails

It is not required but a good idea to setup [rvm](https://rvm.io/) to help you manage different ruby versions. Another good practice is to create gemsets per project, it has the benefit of keeping dependencies isolated.

```shell
rvm use 2.2.1@rails_bump_protocol --create
gem install rails

```

### Postgres & PostGIS

I chose Postgres because of PostGIS which is a spatial database extender for Postgres. This will form the backbone of the solution which is to detect **bumps** in close proximity. Most of the instructions I got out of the [ubuntu wiki page](https://help.ubuntu.com/community/PostgreSQL) but the gist of it is:

```shell
sudo apt-get install postgresql postgresql-contrib postgresql-client postgis postgresql-9.3-postgis-2.1

sudo su postgres
createuser -s rails_bump
psql
\password rails_bump
\q

```

### Rails app

Generate a new rails app in your project directory using  
`rails new rails-bump-protocol` - I'm not sure about the rails app naming convention, after quick google search I could find examples with both "-" and "\_" to separate terms.

Next step is to add the required gems to the project. [RGeo](https://github.com/rgeo/rgeo) is an Active Record extension that provides spatial data types and spacial queries. [Puma](http://puma.io/) is used to ensure that the app can handle concurrent requests.

Change the _Gemfile_:

```ruby
gem 'pg' # replace 'sqlite3'
gem 'rgeo'
gem 'activerecord-postgis-adapter'
gem 'rgeo-geojson' 
gem 'puma'

```

The _database.yml_ file needs to be amended to switch to the `postgis` adapter.

```yaml
default: &default
  adapter: postgis
  pool: 5
  timeout: 5000
  schema_search_path: public
  username: rails_bump
  password: <password>
  host: localhost
  port: 5432

development:
  <<: *default
  database: rails_bump_protocol_dev
  

test:
  <<: *default
  database: rails_bump_protocol_test

```

Finally install the gems and migrate the database.

```shell
bundle install
rake db:setup
rake db:gis:setup

```

## BumpEvent Resource

The solution is backed by two model objects, `BumpEvent` which represents a bump received from a device and a `BumpEventMatch` which is a link between 2 bump events.

![Class Diagram](https://res.cloudinary.com/monkey-codes/image/upload/v1526373864/498605dd_hz5z3p.png)

Since I'm a complete rails noob, I'm going to avoid getting the naming convention wrong and just _generate_ the resource.

```shell
rails g resource BumpEvent device_id:string lonlat:st_point --no-fixture --no-helper --no-assets

rails g model BumpEventMatch bump_event:references

```

The generated migration files will need some specifics applied. First up the `CreateBumpEvents` migration. The `:lonlat` column needs to be marked as `:geographic` to indicate that it will contain _longitude and latitude_ data. We also need to add a spatial index to `:lonlat` since most queries would be around the location.

```ruby
class CreateBumpEvents < ActiveRecord::Migration
  def change
    create_table :bump_events do |t|
      t.string :device_id
      t.st_point :lonlat, :geographic => true

      t.timestamps null: false
    end
    add_index :bump_events, :lonlat, using: :gist
  end
end

```

Next up is the `CreateBumpEventMatches` migration, it needs the foreign key settings in addition to the unique index on `:bump_event_id` and `:matched_event_id`

```ruby
class CreateBumpEventMatches < ActiveRecord::Migration
  def change
    create_table :bump_event_matches do |t|
      t.references :bump_event, index: true, foreign_key: true
      t.references :matched_event, index: true
      t.timestamps null: false
    end

    add_foreign_key :bump_event_matches, :bump_events, column: :matched_event_id
    add_index :bump_event_matches, [:bump_event_id, :matched_event_id], unique: true
  end
end

```

After doing some googling, I came across a [great tutorial on self-referential associations](http://collectiveidea.com/blog/archives/2015/07/30/bi-directional-and-self-referential-associations-in-rails/) and extracted just the parts I needed from it. As the diagram indicates, a `BumpEvent` _has many_ `BumpEvent` _through_ `BumpEventMatches`. The other parts to note are the named scopes which makes for code that reads better.

```ruby
class BumpEvent < ActiveRecord::Base

  has_many :bump_event_matches
  has_many :matched_events, through: :bump_event_matches,
                            dependent: :destroy

  scope :recent, ->() { where('bump_events.created_at >= :time_ago',:time_ago => Time.now - 10.seconds) }
  scope :nearby, ->(point) { where('ST_Distance(lonlat, :point) < :distance',:point => point.as_text, :distance => 10) }

  scope :not_matched_to, ->(bump_event_id) {
    where.not(id: BumpEventMatch.select(:matched_event_id).where(bump_event: bump_event_id))
  }

  scope :bump_matches, ->(bump_event) {
    recent.nearby(bump_event.lonlat).not_matched_to(bump_event.id).where.not(id: bump_event.id)
  }


  def link_to_nearby_bumps()
    matched_events << BumpEvent.bump_matches(self)
  end

end

```
```ruby
class BumpEventMatch < ActiveRecord::Base
  belongs_to :bump_event
  belongs_to :matched_event, class_name: "BumpEvent"
end

```

### Controller & Routes

The controller only needs to support a subset of the RESTFul actions, `POST` to create a `BumpEvent` and `GET` to retrieve it. It's a good idea to separate API controllers from the rest of the application controllers, hence I namespaced and versioned the resource.

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :bump_events, only: [:create, :show]
    end
  end
end

```

The generated `bump_events_controller.rb` needs to be moved into _controllers/api/v1_ to match the namespace defined in the routes file. We also need to tell rails that _API_ is an acronym to facilitate defining the module accordingly instead of _Api_ like convention would dictate.

```ruby
 ActiveSupport::Inflector.inflections(:en) do |inflect|
   inflect.acronym 'API'
 end

```

The basic implementation of the controller is rudimentary and would not scale well. The `create` method saves the `BumpEvent` after decoding the JSON representation of the latitude/longitude which follows [GeojSON](http://geojson.org/) format. Then follows the goofy bit, loop 10 times, sleeping for a second between loops and then linking any `BumpEvents` that the system might have received in the last second.

```ruby
module API
  module V1
    class BumpEventsController < ApplicationController

      def show
        event = BumpEvent.find(params[:id])
        render json: event, status: 200

      end

      def create
        bump_event = BumpEvent.new
        bump_event.device_id = bump_event_params[:device_id]
        bump_event.lonlat = RGeo::GeoJSON.decode(bump_event_params[:lonlat], json_parser: :json)

        if bump_event.save
          (1..10).each do
            sleep 1
            bump_event.link_to_nearby_bumps
          end
          render json: bump_event.to_json(include: {matched_events: {only: [:id, :device_id]}}),
            status: 201, location: api_v1_bump_event_url(bump_event[:id])
        end

      end

      private


      def bump_event_params
        params.require(:bump_event).permit(:device_id, lonlat: [:type, coordinates: []])
      end

    end
  end
end

```

### Tweaks

Considering the fact that API's are usually stateless, the CSRF protection behavior needs to change to `:null_session`. Any other way would make the API calls fail due to an invalid CSRF token.

```ruby
class ApplicationController < ActionController::Base  
  protect_from_forgery with: :null_session
end 

```

Due to the primitive implementation of the Controller the rails app needs to be configured to allow concurrency since we would need at least two concurrent requests to facilitate a match.

```ruby
module RailsBumpProtocol
  class Application < Rails::Application
    ...   
    config.allow_concurrency = true
  end
end

```

The last tweak is to change the default JSON generator for spatial types to the GeoJSON generator provided by RGeo. Add a new file _config/initializers/rgeo.rb_

```ruby
RGeo::ActiveRecord::GeometryMixin.set_json_generator(:geojson)

```

## Basic test

At this point you should be able to test the API, but first the DB needs to be migrated

```shell
rake db:migrate
rails s Puma

```

Open up two separate terminals and issue the below curl command in quick succession from both of them

```shell
curl -H "Content-Type: application/json" -X POST -d '{"device_id":"'$RANDOM'","lonlat":{"type":"Point", "coordinates":[-122.3989885,37.7905576]}}' http://localhost:3000/api/v1/bump_events

```

You should receive a 201 response code and a body similar to:

```javascript
{
  "id": 64,
  "device_id": "21985",
  "lonlat": {
    "type": "Point",
    "coordinates": [
      -122.3989885,
      37.7905576
    ]
  },
  "created_at": "2015-12-31T04:30:53.518Z",
  "updated_at": "2015-12-31T04:30:53.518Z",
  "matched_events": [
    {
      "id": 63,
      "device_id": "6737"
    }
  ]
}

```

## Conclusion

Although this solution has a few weaknesses, it does provide the basic components of a working prototype. To get past the _10s sleep_ one might consider a polling solution from the device or maybe some other mechanism for pushing the _matched events_ back to each device.

An alternative approach may be to return immediately and let each bump event take care for linking both ways during creation. Each device can then request all the _matches_ some time after the initial bump, thereby moving the delay to the client device.

The source code is available on [github.](https://github.com/monkey-codes/rails-bump-protocol)
