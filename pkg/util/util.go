package util

import (
	"io"
	"os"
	"os/exec"
)

type PackageManagers struct {
	NPM  bool
	Yarn bool
}

func CheckPackageManagers() PackageManagers {
	packageManagers := PackageManagers{
		NPM:  false,
		Yarn: false,
	}

	_, err := exec.LookPath("npm")

	if err == nil {
		packageManagers.NPM = true
	}

	_, err = exec.LookPath("yarn")

	if err == nil {
		packageManagers.Yarn = true
	}

	return packageManagers
}

func CopyFile(src, dst string) error {
	in, err := os.Open(src)

	if err != nil {
		return err
	}

	defer in.Close()

	out, err := os.Create(dst)

	if err != nil {
		return err
	}

	defer out.Close()

	_, err = io.Copy(out, in)

	if err != nil {
		return err
	}

	return out.Close()
}
