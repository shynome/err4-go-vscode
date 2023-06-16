package main

import (
	"bufio"
	"flag"
	"log"
	"os"
	"strings"

	"github.com/lainio/err2"
	"github.com/lainio/err2/try"
	"github.com/shynome/err4/pkg/transpile"
)

var args struct {
	debug bool
}

func init() {
	flag.BoolVar(&args.debug, "debug", false, "")
}

func main() {
	flag.Parse()

	r := bufio.NewReader(os.Stdin)
	for {
		line, _, err := r.ReadLine()
		if err != nil {
			log.Fatal(err)
		}
		go func(filepath string) {
			defer err2.Catch(func(err error) {
				log.Println("transform file", filepath, "failed", err)
			})
			if args.debug {
				log.Println("ransform file", filepath)
			}
			b, err4file, err := transpile.Transform(filepath, nil)
			if !err4file {
				return
			}
			p := err4path(filepath)
			try.To(os.WriteFile(p, b.Bytes(), os.ModePerm))
			try.To(err)
			return
		}(string(line))
	}
}

func err4path(f string) string {
	return strings.TrimSuffix(f, ".go") + "_err4.go"
}
