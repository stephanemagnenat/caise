import numpy as np

def unitv(v):
	return v / np.linalg.norm(v)

def dist(a, b):
	return np.linalg.norm(b - a)
