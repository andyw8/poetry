# frozen_string_literal: true

source "https://rubygems.org"

# Specify your gem's dependencies in poetry.gemspec
gemspec

# The sibling gems live in this repository under gems/, so the bundle always
# resolves them from the tree beside this file; consumers get the gemspec's
# exact pins from RubyGems.
gem "poetry-core", path: "gems/poetry-core"
gem "poetry-lucide", path: "gems/poetry-lucide"
gem "poetry-ui", path: "gems/poetry-ui"

gem "bundler-audit", require: false
gem "irb"
gem "minitest", "~> 6.0.6"
gem "rake", "~> 13.0"
gem "rubocop", "~> 1.21"
gem "rubocop-minitest", require: false
gem "rubocop-performance", require: false
gem "rubocop-rake", require: false
# Not on RubyGems yet; the cops the component gems are being measured against.
gem "rubocop-view_component", github: "andyw8/rubocop-view_component", branch: "main", require: false
gem "rubocop-yard", require: false
gem "yard", require: false
gem "yard-lint", require: false
