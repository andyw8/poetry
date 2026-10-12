# frozen_string_literal: true

require "test_helper"

# A host application's own controller wearing the docs layout through
# Poetry::Docs::HostLayout: the sidebar, header and meta render, and every
# link the layout draws still points into the engine.
class HostLayoutTest < ActionDispatch::IntegrationTest
  class HostPagesController < ActionController::Base
    include Poetry::Docs::HostLayout

    def show
      render inline: <<~ERB, layout: true
        <% content_for :title, "Hosted page" %>
        <h1>A page the host serves</h1>
      ERB
    end
  end

  test "a host controller renders inside the docs layout with the engine's links" do
    with_routing do |routes|
      routes.draw do
        get "/hosted" => "host_layout_test/host_pages#show"
        mount Poetry::Docs::Engine => "/"
      end

      get "/hosted"

      assert_response :success
      assert_select "title", "Hosted page — poetry"
      assert_select "h1", "A page the host serves"
      assert_select "a[aria-label='Poetry home'][href='/']"
      assert_select "[data-slot=sidebar-menu-button][href='/docs']", minimum: 1
      assert_select "a[href='/agent-skills']", minimum: 1
    end
  end
end
