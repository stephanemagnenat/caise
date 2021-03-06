import numpy as np
import time
import random
from abc import ABC, abstractmethod

from constants import *
from utils import *

def _clip_field(pos, mx, my):
	# if wrong quadrant, return
	if mx * pos[0] < 0 or my * pos[1] < 0:
		return
	test_pos = pos * [mx, my]
	# in side area, return
	if test_pos[0] >= WORLD_CIRCLE_RADIUS - WORLD_EPSILON:
		return
	# in passageway area, return
	if test_pos[1] <= WORLD_PASSAGEWAY_HALF_WIDTH + WORLD_EPSILON:
		return
	# in circle, return
	test_pos_length = np.linalg.norm(test_pos)
	if test_pos_length <= WORLD_CIRCLE_RADIUS + WORLD_EPSILON:
		return
	# clipping must happen, see what is closest
	dist_side = WORLD_CIRCLE_RADIUS - test_pos[0]
	assert dist_side > 0
	dist_passageway = test_pos[1] - WORLD_PASSAGEWAY_HALF_WIDTH
	assert dist_passageway > 0
	dist_circle = test_pos_length - WORLD_CIRCLE_RADIUS
	assert dist_circle > 0
	min_penetration_method = np.argmin([dist_side, dist_passageway, dist_circle])
	if min_penetration_method == 0:
		pos[0] = WORLD_CIRCLE_RADIUS * mx
	elif min_penetration_method == 1:
		pos[1] = WORLD_PASSAGEWAY_HALF_WIDTH * my
	elif min_penetration_method == 2:
		pos[:] = pos * WORLD_CIRCLE_RADIUS / test_pos_length
	else:
		assert False

def _is_on_hole(pos, mx, my):
	test_pos = pos * [mx, my]
	if test_pos[0] <= WORLD_CENTER_HALF_WIDTH:
		return False
	if test_pos[1] <= WORLD_CENTER_HALF_WIDTH:
		return False
	test_pos_length = np.linalg.norm(test_pos)
	if test_pos_length >= WORLD_CIRCLE_INNER_RADIUS:
		return False
	return True

def clip_to_field(pos):
	for my in [-1,1]:
		for mx in [-1,1]:
			_clip_field(pos, mx, my)

def is_on_hole(pos):
	for my in [-1,1]:
		for mx in [-1,1]:
			if _is_on_hole(pos, mx, my):
				return True
	return False

class GameObject(ABC):
	def __init__(self, id, r):
		super().__init__()
		self.id = id
		self.r = r
		self.pos = np.zeros(2)
		self.speed = np.zeros(2)
		self.speed_hl = 0
		self.last_state_msg = None

	def step(self, dt, cur_time):
		# return true if clipping occurs
		self.pos += self.speed * dt
		# if speed half life, apply
		if self.speed_hl > 0:
			self.speed *= np.power(2, -dt / self.speed_hl)
		# clip external rectangle
		new_pos = np.clip(self.pos, [-WORLD_HALF_SIZE_X, -WORLD_HALF_SIZE_Y], [WORLD_HALF_SIZE_X, WORLD_HALF_SIZE_Y])
		clip_to_field(new_pos)
		if not np.array_equal(new_pos, self.pos):
			self.pos = new_pos
			self.speed[:] = [0,0]
			self.speed_hl = 0.
			return True
		return False

	def does_collide(self, other, deinterlace_vector = None):
		""" Return whether there is collision with other, if so and interlace_vector is given, fill it with how to move self to deinterlace """
		delta_pos = self.pos - other.pos
		sum_r = other.r + self.r
		cur_dist = np.linalg.norm(delta_pos)
		is_collision = cur_dist < sum_r
		if is_collision and deinterlace_vector is not None:
			if cur_dist == 0:
				deinterlace_vector[:] = [sum_r, 0]
			else:
				deinterlace_vector[:] = delta_pos * (sum_r - cur_dist) / cur_dist
		return is_collision

	@abstractmethod
	def get_object_type(self):
		pass

	def get_json_state(self, full):
		# round pos and speed
		self.pos = np.round(self.pos, 3)
		self.speed = np.round(self.speed, 3)
		# build state
		json_state = {
			'id': self.id,
			'pos': self.pos.tolist(),
			'speed': self.speed.tolist(),
			'speed_hl': self.speed_hl
		}
		if full:
			json_state['object'] = self.get_object_type()
		return json_state


class Ball(GameObject):
	def __init__(self, id):
		GameObject.__init__(self, id, 0.9)

	def get_object_type(self):
		return "ball"


class Box(GameObject):
	def __init__(self, id):
		GameObject.__init__(self, id, 1)

	def get_object_type(self):
		return "box"


class SuperBox(GameObject):
	def __init__(self, id):
		GameObject.__init__(self, id, 1.5)

	def get_object_type(self):
		return "superbox"


class Bullet(GameObject):
	def __init__(self, id, weapon):
		GameObject.__init__(self, id, 0.5)
		self.weapon = weapon

	def get_object_type(self):
		return "bullet"

	def get_json_state(self, full):
		json_state = super(Bullet, self).get_json_state(full)
		if full:
			json_state['weapon'] = self.weapon
		return json_state


class Player(GameObject):
	def __init__(self, name, id):
		GameObject.__init__(self, id, 1.5)
		self.name = name
		self.has_ball = False
		self.score = 0
		self.last_time_stunned = 0.
		self.speed_cmd = np.zeros(2)
		self.last_dir = np.array([1,0])
		self.color = random.uniform(0,1)
		self.spikiness = random.uniform(0,1)
		self.weapon = -1
		self.power = -1
		self.weapon_fired = False
		self.last_time_weapon_fired = 0.
		self.last_slowdown_hit = 0
		self.is_stunned = False

	def move(self, speed, factor):
		self.speed_cmd = np.array(speed) * factor

	def fire(self):
		self.weapon_fired = True

	def set_speed(self, speed):
		self.speed = speed
		if np.any(self.speed):
			self.last_dir = unitv(self.speed)

	def step(self, dt, cur_time):
		needs_update = False
		# previous state
		was_stunned = self.is_stunned
		old_speed = self.speed
		# can we apply speed?
		self.is_stunned = cur_time - self.last_time_stunned < STUNNED_DURATION
		if not self.is_stunned:
			factor = 1.
			if cur_time - self.last_slowdown_hit < SLOWDOWN_DURATION:
				factor = SLOWDOWN_FACTOR
			self.set_speed(self.speed_cmd * factor)
		# do the step
		needs_update = super(Player, self).step(dt, cur_time)
		# is on hole
		if is_on_hole(self.pos):
			self.pos[:] = [0,0]
			self.speed[:] = [0,0]
			self.speed_hl = 0.
			self.score -= FALL_IN_HOLE_POINT_LOSS
			self.last_time_stunned = cur_time
			needs_update = True
		# update needed if speed changed
		needs_update = not np.array_equal(old_speed, self.speed) or needs_update
		# update needed if stunned status changed
		self.is_stunned = cur_time - self.last_time_stunned < STUNNED_DURATION
		needs_update = self.is_stunned != was_stunned or needs_update
		return needs_update

	def get_object_type(self):
		return "player"

	def get_json_state(self, full):
		json_state = super(Player, self).get_json_state(full)
		if full:
			json_state['name'] = self.name
		json_state['has_ball'] = self.has_ball
		json_state['score'] = self.score
		json_state['color'] = round(self.color, 2)
		json_state['spikiness'] = round(self.spikiness, 2)
		json_state['weapon'] = self.weapon
		json_state['power'] = self.power
		json_state['stunned'] = self.is_stunned
		return json_state
