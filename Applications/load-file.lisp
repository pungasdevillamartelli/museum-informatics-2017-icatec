
(defun load-application-file (filename)
  (load (application-relative-pathname filename)))

(defun initialize-default-applications ()
  (load-application-file "Applications\\ant-food-collecting-problem.lisp")
  (load-application-file "Applications\\mux-problems.lisp")
 ;(load-application-file "Applications\\opengl-free-drawing-application.lisp")
  (load-application-file "Applications\\opengl-free-drawing-application-2d.lisp")
  (load-application-file "Applications\\opengl-free-drawing-application-2d-ext-1.lisp")
 ;(load-application-file "Applications\\opengl-free-drawing-application-3d.lisp")
  (load-application-file "Applications\\opengl-fragment-drawing-application.lisp")
  (load-application-file "Applications\\intro-sequencer.lisp")
  (load-application-file "Applications\\intro-definition-language.lisp")
  (load-application-file "Applications\\pane-intro-sequencer.lisp")
;  (load-application-file "Applications\\language-rgb-vector.lisp")
  )