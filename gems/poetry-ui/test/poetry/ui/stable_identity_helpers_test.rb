# frozen_string_literal: true

require "test_helper"

module Poetry
  module Ui
    # The stable-identity rules against ui's own registry: helpers that
    # render plain tags and mint no id stay quiet inside a loop (key: on
    # them would only leak as an HTML attribute), while a minting
    # component beside them still warns.
    class StableIdentityHelpersTest < ActiveSupport::TestCase
      def test_native_select_option_and_optgroup_in_a_loop_are_clean
        catalog = Poetry::Core::Check::Catalog.from_registry(Poetry::Ui.root)
        findings = Poetry::Core::Check::StableIdentity.new(catalog).lint(<<~ERB)
          <%= poetry_native_select(name: "country") do %>
            <% @regions.each do |region| %>
              <%= poetry_native_select_optgroup(label: region.name) do %>
                <% region.countries.each do |country| %>
                  <%= poetry_native_select_option(value: country.code) { country.name } %>
                <% end %>
              <% end %>
            <% end %>
          <% end %>
          <% @rows.each do |row| %>
            <%= poetry_badge { row.state } %>
            <%= poetry_checkbox(name: "rows[]") %>
          <% end %>
        ERB

        assert_equal ["stable-identity/collection"], findings.map(&:rule), findings.map(&:message).join("\n")
        assert_includes findings.first.message, "poetry_checkbox", "only the minting component warns"
      end
    end
  end
end
