{
  description = "simple, self-hosted url shortener";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems =
        [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];

      perSystem = { config, self', inputs', pkgs, system, ... }: {
        packages = {
          short-af = pkgs.stdenv.mkDerivation {
            pname = "short-af";
            version = "0.0.0";

            src = ./.;

            dontBuild = true;

            installPhase = ''
              mkdir -p $out/share/short-af
              cp -r $src/public/index.html $out/share/short-af
            '';
          };

          default = self'.packages.short-af;
        };

        apps = {
          short-af = {
            type = "app";
            program = pkgs.writeShellApplication {
              name = "short-af";
              runtimeInputs = with pkgs; [ nodejs wrangler ];
              text = ''
                wrangler dev
              '';
            };
          };

          default = self'.apps.short-af;
        };

        devShells.default =
          pkgs.mkShell { packages = with pkgs; [ nodejs wrangler ]; };
      };
    };
}
