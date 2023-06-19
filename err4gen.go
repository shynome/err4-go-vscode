package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/lainio/err2"
	"github.com/lainio/err2/try"
	"github.com/shynome/err4/pkg/transpile"
)

var args struct {
	debug bool
	addr  string
}

func init() {
	flag.BoolVar(&args.debug, "debug", false, "")
	flag.StringVar(&args.addr, "addr", "127.0.0.1:4797", "")
}

func main() {
	flag.Parse()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		filepath := r.URL.Path
		defer err2.Catch(func(err error) {
			w.WriteHeader(500)
			fmt.Fprintln(w, "err", err)
		})
		if args.debug {
			log.Println("ransform file", filepath)
		}
		p := err4path(filepath)
		b, err4file, err := transpile.Transform(filepath, r.Body)
		if err == nil && !err4file {
			_ = os.Remove(p)
			fmt.Fprintln(w, "removed")
			return
		}
		try.To(os.WriteFile(p, b.Bytes(), os.ModePerm))
		try.To(err)
		fmt.Fprintln(w, "saved")
	})

	if err := http.ListenAndServe(args.addr, nil); err != nil {
		log.Fatalln(err)
	}
}

func err4path(f string) string {
	return strings.TrimSuffix(f, ".go") + "_err4.go"
}
