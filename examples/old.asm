start:*=$1000; cannot have any identifier only numbers
loop1:pass = * + * + 2 + loop1 ;helloka
var2 = 1
var3 = 1+2+*
var4 = $100
store:dd= 1 + $100 - %1000000010010011 + loop1 - * + 10000;kukori 
lda $01
sta $02
ror 
rol 1
ldx #12
lda ($fd),y
lda ($fd,x)
ldy #%11111111
tax
dex
lda loop1
lda var2
lda var4
loop2: lda store
bne loop2
rts
.byte &gt;*, &lt;*, 100,200, $400, %10001000
.word *, loop1, &gt;loop1
strings:.string "helloka"