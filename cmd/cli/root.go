package cli

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:     "sern",
	Short:   "A powerful CLI tool for Sern.",
	Version: "0.1.1",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Sern CLI")
	},
}

func Execute() {
	rootCmd.Flags().BoolP("help", "h", false, "Help for the Sern CLI.")
	rootCmd.Flags().BoolP("version", "v", false, "The version of the Sern CLI.")
	rootCmd.SetVersionTemplate("Sern CLI - Version {{.Version}}\n")
	rootCmd.AddCommand(initCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
