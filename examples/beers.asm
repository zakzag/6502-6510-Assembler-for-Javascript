*= $C000

org: 
	ldx  #99
bloop: 
	jsr xout
	lda	#<bobot
	ldy	#28
	jsr	strout
	lda	#<comcr
	ldy	#2
	jsr	strout
	jsr	xout
	lda	#<bobot
	ldy	#16
	jsr	strout
	lda	#<bobpa
	ldy	#33
	jsr	strout
	dex
	jsr	xout
	lda	#<bobot
	ldy	#28
	jsr	strout
	lda	#<bobpa
	ldy	#2
	jsr	strout
	txa
	bne	bloop
	lda	#<endtx
	ldy	#37
	jsr	strout
	lda	#<bobot
	ldy	#30
strout: 
	sta ldins+1
ldins: 
	lda org
	jsr	$ffd2
	inc	ldins+1
	dey
	bne	ldins
outdon: 
	rts

xout: 
	txa
	pha
	lda	#0
	jsr	$bdcd
	pla
	tax
	rts

bobot: 
	.text " BOTTLES OF BEER ON THE WALL"
bobpa: 
	.text "."
	.byte	13
	.text	"TAKE ONE DOWN, PASS IT AROUND,"
	.byte	13
endtx: 
	.text "GO TO THE STORE AND BUY SOME MORE"
comcr: 
	.text ","
	.byte	13
	.text	"99"