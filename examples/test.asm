*= $2000+1
hellotext:
lda 1
.text "hello"
.word $1000, $2000, $2001, $2002
.byte $12, $14, 3+3, <$3311, >$2233

lda <hellotext

hellotext2: lda #$a
le = hellotext3+1
hellotext3= hellotext4+1
hellotext4=*+1

lda hellotext4
lda hellotext3
lda hellotext2

hellotext6 = * + hellotexte2 - hellotext + hellotext3 +1 +2+3+3-hellotext4