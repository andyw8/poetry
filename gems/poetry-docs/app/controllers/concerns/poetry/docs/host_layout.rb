# frozen_string_literal: true

module Poetry
  module Docs
    # The docs site's layout for a host application's own controllers: a
    # page the host serves beside the docs wears the same sidebar, header,
    # search and meta tags. The layout reaches the engine's routes through
    # its mount proxy (`poetry_docs.`), so it renders from either side, and
    # its partials live under the engine's namespace, so a host's own
    # `shared/` partials never stand in for them. The host mounts the
    # engine under its default name, `poetry_docs`.
    #
    # @example A host page on the docs site
    #   class RegistriesController < ApplicationController
    #     include Poetry::Docs::HostLayout
    #
    #     def index
    #       content_for :title, "Registries"
    #     end
    #   end
    module HostLayout
      extend ActiveSupport::Concern

      included do
        layout "poetry/docs/application"
        helper Poetry::Docs::PageMetaHelper, Poetry::Docs::DocsHelper
      end
    end
  end
end
