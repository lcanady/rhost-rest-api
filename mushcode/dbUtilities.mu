&ufun.db DBU= 
  [setq(0,
    if(not(match(%2,)),
      ?value=%2
    )
  )]
  [if(
    hasflag(%#,immortal),  
    [execscript(stats.js, [num(*%0)]/%1%q0)],
    #-1 Permission Denied
  )]

&ufun.avatar DBU=
  [setq(0,db(%0,profile.avatar))]
  [if(not(match(%q0,#-*)),%q0)]

@startup DBU= @dolist [lattr(me/UFUN.*)] =  
    @function/pres/priv [after(##,UFUN.)] = %!/##
  