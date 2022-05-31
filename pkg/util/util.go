package util

import "os/exec"

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
